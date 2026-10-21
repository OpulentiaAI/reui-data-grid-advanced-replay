import React, { useMemo } from "react";
import { P0 } from "./reuiPage0";
import { P1 } from "./reuiPage1";
import { P2 } from "./reuiPage2";
import { P3 } from "./reuiPage3";
import { P4 } from "./reuiPage4";
import { P5 } from "./reuiPage5";
import { P6 } from "./reuiPage6";
import { P7 } from "./reuiPage7";
/** Offline 1:1 replay of reui.io/blocks/data-grid/advanced: the docs shell plus all 8 live block previews (each its own Next.js document), served from memory. No network. */
export function ReUIDataGridAdvanced11() {
  const srcDoc = useMemo(() => new TextDecoder().decode(Uint8Array.from(atob(P0 + P1 + P2 + P3 + P4 + P5 + P6 + P7), c => c.charCodeAt(0))), []);
  return <iframe title="ReUI data grid advanced replay" data-reui-replay="" srcDoc={srcDoc} sandbox="allow-scripts allow-same-origin" style={{ display: "block", width: "100%", height: "100vh", border: 0, background: "#09090b" }} />;
}
export default ReUIDataGridAdvanced11;
