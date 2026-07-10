import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import QRCode from "react-qr-code";

export function QrCodeSheet({
  isOpen,
  onClose,
  qrPayload,
  qrCode,
  title = "Удостоверение личности",
}: {
  isOpen: boolean;
  onClose: () => void;
  qrPayload: string;
  qrCode: string;
  title?: string;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
          >
            <div className="w-full max-w-[430px] bg-white rounded-t-[24px] p-3 pb-20 pointer-events-auto relative">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />

              <div className="flex justify-between items-center mb-5">
                <h2 className="text-[20px] font-bold text-black">{title}</h2>
                <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="text-center space-y-4 ">
                <p className="text-[15px] text-gray-500">
                  Покажите QR-код сотруднику
                </p>

                <div className="flex justify-center">
                  <div className="p-1.5 bg-white rounded-2xl">
                    <QRCode value={qrPayload} size={110} />
                  </div>
                </div>

                <div className="space-y-1 mb-5">
                  <p className="text-[15px] text-gray-500">или скажите код</p>
                  <p className="text-[25px] font-bold text-black tracking-[0.05em]">
                    {qrCode}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
