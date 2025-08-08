import { useEffect } from "react";

const AuthCallBack = () => {
  useEffect(() => {
    // Extract id_token from URL hash or query
    const params = new URLSearchParams(window.location.hash.substring(1));
    const idToken = params.get("id_token");
    if (idToken && window.opener) {
      window.opener.postMessage({ idToken }, window.location.origin);
      window.close();
    }
  }, []);
  return <p>Closing...</p>;
};

export default AuthCallBack;
