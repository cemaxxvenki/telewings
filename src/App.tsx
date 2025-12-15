import { useState } from "react";
import { isAuth } from "./utils/auth";
import Login from "./pages/Login";
import Index from "./pages/Index"; // ✅ this exists in Lovable exports

function App() {
  const [ok, setOk] = useState(isAuth());

  if (!ok) {
    return <Login onOk={() => setOk(true)} />;
  }

  return <Index />;
}

export default App;
