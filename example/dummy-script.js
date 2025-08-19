import { create } from "node:domain";
import { createChameleon } from "../src/index";

const init = () => {
  const map = createChameleon({});
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
