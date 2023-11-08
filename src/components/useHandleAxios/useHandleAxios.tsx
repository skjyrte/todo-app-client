import { useEffect, useState, useRef, useMemo } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios, { isCancel, AxiosError } from "axios";

type requestConfig = {
  url?: string;
  baseURL?: string;
  initialIsLoading?: boolean;
  /*   withCredentials?: boolean; */
  onSuccess?: Function;
  onError?: Function;
  method?: any;
  data?: any;
};

type validResponse = {
  success: boolean;
  message: string;
  data: any; // ? TO FIX LATER!!!
};

type requestFunction = any;
type requestResult = [validResponse, requestFunction];

const defaultConfig: requestConfig = {
  url: "",
  method: "get",
  initialIsLoading: false,
  baseURL: process.env.REACT_APP_API_URL,
  onSuccess: Function.prototype,
  onError: Function.prototype,
};

export default function HandleAxios(
  filterProps: any,
  ref: any,
  shutTheEdit: any,
  inView: any
) {
  const [toDos, setToDos] = useState<any[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const refController = useRef(new AbortController());

  const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 1000,
    headers: { "Content-Type": "application/json" },
    url: `${process.env.REACT_APP_API_URL}/todos/`,
    signal: refController.current.signal,
    params: { page: pageNumber, filter: filterProps },
    /*          mode: "cors",  */
  });

  async function handleGetEntries() {
    setLoading(true);
    shutTheEdit();

    /*     const options = {
      mode: "cors",
      params: { page: pageNumber, filter: filterProps },
      };
 */
    try {
      /*       const response = await axios.request(options); */
      const response = await instance("/todos/");
      const responseBody = await response.data;

      if (responseStatus(responseBody)) {
        if (
          typeof responseBody.data === "object" &&
          responseBody.success === true
        ) {
          return responseBody.data.currentData;
        } else {
          throw new Error(responseBody.message);
        }
      } else {
        throw new Error("GET: error getting response");
      }
    } catch (e: any) {
      toast.error("Unable to get the entries.", {
        position: toast.POSITION.TOP_CENTER,
      });
      return [];
    } finally {
      setLoading(false);
    }
  }

  const responseStatus = (obj: any): obj is validResponse => {
    return (
      typeof obj === "object" &&
      obj !== null &&
      "success" in obj &&
      typeof obj.success === "boolean" &&
      "message" in obj &&
      typeof obj.message === "string" &&
      (("data" in obj && typeof obj.data === "object") || !("data" in obj))
    );
  };

  useEffect(() => {
    refController.current = new AbortController();
    setToDos([]);
    setPageNumber(1);
    setHasMore(false);
    setLoading(false);
    return () => refController.current.abort();
  }, [filterProps]);

  useEffect(() => {
    if (
      (inView === true && hasMore === true && loading === false) ||
      pageNumber === 1
    ) {
      (async () => {
        await handleLoadMore();
      })();
    }
  }, [inView, ref.current, filterProps]);

  async function handleLoadMore() {
    const result = await handleGetEntries();

    await (() => {
      setToDos((prevState) => [...prevState, ...result]);
      setHasMore(result.length > 0);
      if (result.length > 0) {
        setPageNumber((prevPageNumber) => prevPageNumber + 1);
      }
    })();
  }

  return toDos;
}