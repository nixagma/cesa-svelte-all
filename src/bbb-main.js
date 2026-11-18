import { mount } from "svelte";
import Bbb from "./Bbb.svelte";

const app = mount(Bbb, {
  target: document.getElementById("app")
});

export default app;
