import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Register } from './pages/register'


function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="register" element={<Register />} />
          {/* <Route path="/" element={<Layout />}> */}
          {/* <Route index element={<Home />} /> */}
          {/* <Route path="*" element={<NoPage />} /> */}
          {/* </Route> */}
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
