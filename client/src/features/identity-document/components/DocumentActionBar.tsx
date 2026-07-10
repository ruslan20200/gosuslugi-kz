import { POSITIONS } from "../constants/documentLayout";
import { PresentIcon, SendIcon } from "./ActionIcons";
import { cn } from "@/lib/utils";

export function DocumentActionBar({
  activeTab,
  onPresentDocument,
  onShareDocument,
  onSendRequisites,
}: {
  activeTab: "document" | "details";
  onPresentDocument: () => void;
  onShareDocument: () => void;
  onSendRequisites: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none bg-white border-t border-gray-200 overflow-x-hidden">
      <div
        className={cn(
          "w-full max-w-[430px] py-3 pointer-events-auto space-y-3",
          activeTab === "details" ? "px-7" : "px-4"
        )}
        style={{
          paddingBottom: `max(${POSITIONS.buttons.paddingBottom}px, env(safe-area-inset-bottom))`,
        }}
      >
        {activeTab === "document" ? (
          <>
            <button
              onClick={onPresentDocument}
              className="w-full bg-[#2E7DE1] text-white font-semibold py-3.5 rounded-[12px] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
            >
              <PresentIcon />
              Предъявить документ
            </button>
            <button
              onClick={onShareDocument}
              className="w-full border border-[#2E7DE1] bg-white text-[#2E7DE1] font-semibold py-3.5 rounded-[12px] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
            >
              <SendIcon />
              Отправить документ
            </button>
          </>
        ) : (
          <button
            onClick={onSendRequisites}
            className="w-full border border-[#2E7DE1] text-[#2E7DE1] font-semibold py-3.5 rounded-[12px] flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform"
          >
            <SendIcon />
            Отправить реквизиты
          </button>
        )}
      </div>
    </div>
  );
}
