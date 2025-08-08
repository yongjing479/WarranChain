import { useEffect } from "react";

const AuthCallBack = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.substring(1));
    const idToken = params.get("id_token");
    const error = params.get("error");

    if (error) {
      console.error("OAuth error:", error);
      if (window.opener) {
        window.opener.postMessage({ error }, window.location.origin);
        window.close();
      }
      return;
    }

    if (!idToken) {
      console.error("No id_token found in callback");
      if (window.opener) {
        window.opener.postMessage({ error: "No id_token found" }, window.location.origin);
        window.close();
      }
      return;
    }

    if (!window.opener) {
      console.error("No opener window found");
      return;
    }

    window.opener.postMessage({ idToken }, window.location.origin);
    window.close();
  }, []);

  return <p>Processing authentication...</p>;
};

export default AuthCallBack;