import { Card } from "antd";
import FreeOnly from "./FreeOnly";
import AdSlot from "./AdSlot";
const SLOT_GLOBAL = import.meta.env.VITE_ADS_SLOT_GLOBAL;

export default function GlobalAdBar() {
  return (
    <FreeOnly>
      <div style={{ marginTop: 16 }}>
        <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 12 }}>
          <AdSlot enabled slot= {SLOT_GLOBAL} style={{ minHeight: 120 }} />
        </Card>
      </div>
    </FreeOnly>
  );
}
