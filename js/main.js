const csvFile = document.getElementById("csvFile");
const btnSubmit = document.getElementById("btnSubmit");
const table = document.getElementById("table");
const form = document.getElementById("form");
const reloadBtn = document.getElementById("reload");

let dataTable;

const parseCSV = (csv) => {
  const lines = csv.split("\n").filter((line) => line != "");
  const header = lines.shift().split(";");

  let headerTable = header.map((title) => ({
    title: title,
    data: _.camelCase(title.replace(/\r?\n|\r/, "")),
  }));

  headerTable = [
    {
      title: "",
      target: 0,
      className: "treegrid-control",
      data: (item) => (item.children.length > 0 ? "+" : ""),
    },
    ...headerTable,
  ];

  const content = lines.map((line) => {
    const cell = line.split(";");
    let object = {};
    header.forEach((title, index) => {
      return (object[_.camelCase(title)] = cell[index].replace(/\r?\n|\r/, ""));
    });
    return object;
  });

  const nest = (items, id = null, link = "parentId") =>
    items
      .filter((item) => item[link] === id)
      .map((item) => {
        let result = {
          ...item,
          children: nest(items, item.id, link),
        };
        return result;
      });

  const TreeGrid = nest(content, "-1");

  return {
    header: headerTable,
    content: TreeGrid,
  };
};

btnSubmit.addEventListener("click", (e) => {
  e.preventDefault();
  const fileUpload = csvFile.files[0];
  if (fileUpload && fileUpload.type == "text/csv") {
    form.style.display = "none";
    reloadBtn.style.display = "block";
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = parseCSV(e.target.result);

      console.log(data.content);

      dataTable?.destroy();

      dataTable = new DataTable("#table", {
        paging: false,
        ordering: false,
        info: false,
        searching: false,
        language: {
          zeroRecords: " ",
        },
        columns: data.header,
        data: data.content,
        treeGrid: {
          expandIcon: "<span>+</span>",
          collapseIcon: "<span>-</span>",
        },
      });
    };
    reader.readAsText(fileUpload);
    csvFile.value = "";
  } else {
    alert("please upload a CSV file");
    csvFile.value = "";
  }
});

reloadBtn.addEventListener("click", () => {
  window.location.reload();
});
