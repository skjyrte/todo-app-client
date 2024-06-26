import { useEffect } from "react";
import { toast } from "react-toastify";

const useDisclaimerToast = () => {
  let location = window.location.hostname;

  useEffect(() => {
    if (location === "todo-app-client-vrgo.onrender.com") {
      toast.warn(
        "DISCLAIMER: 1. This is a live preview of todo app. 2. Todos added will be persisted in database unless deleted by user. 3. App author is not responsible for todos contents placed by users.",
        {
          position: "bottom-center",
          autoClose: false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    }
  }, []);
};

export default useDisclaimerToast;
