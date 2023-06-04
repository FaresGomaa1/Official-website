const sections = document.querySelectorAll(".section");
const secBtns = document.querySelectorAll(".controls");
const secBtn = document.querySelectorAll(".control");
const allSections = document.querySelector(".main-content");

function PageTrans() {
  // btn click
  secBtn.forEach((btn) => {
    btn.addEventListener("click", function () {
      const currentBtn = document.querySelector(".active-btn");
      if (currentBtn) {
        currentBtn.classList.remove("active-btn");
      }
      this.classList.add("active-btn");
    });
  });

  //sections active class
  allSections.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (id) {
      // remove selevted from
      secBtns.forEach((btn) => {
        btn.classList.remove("active");
      });
      e.target.classList.add("active");
      sections.forEach((section) => {
        section.classList.remove("active");
      });
      const element = document.getElementById(id);
      element.classList.add("active");
    }
  });
  //togel them
  const themeBtn = document.querySelector(".them-btn");
  themeBtn.addEventListener("click", () => {
    let element = document.body;
    element.classList.toggle("light-mode");
  });
}
PageTrans();
