import { mount } from "svelte";
import Home from "./Home.svelte";

const app = mount(Home, {
  target: document.getElementById("app")
});

export default app;
