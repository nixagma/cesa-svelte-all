import { mount } from "svelte";
import Users from "./Users.svelte";

const app = mount(Users, {
  target: document.getElementById("app")
});

export default app;
