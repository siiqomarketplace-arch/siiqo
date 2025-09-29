"use client";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface NotificationModalProps {
  open: boolean;
  title: string;
  description: string;
  variant?: "success" | "error" | "warning" | "info";
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  open,
  title,
  description,
  variant = "info",
  onClose,
}) => {
  const iconMap = {
    success: <CheckCircle className="h-6 w-6 text-green-500" />,
    error: <XCircle className="h-6 w-6 text-red-500" />,
    warning: <AlertCircle className="h-6 w-6 text-yellow-500" />,
    info: <AlertCircle className="h-6 w-6 text-blue-500" />,
  };

  // Auto-close after 3 seconds
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm rounded-2xl shadow-lg">
        <DialogHeader className="flex items-center gap-3">
          {iconMap[variant]}
          <div>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;

// steps

// const [modal, setModal] = useState({
//   open: false,
//   title: "",
//   description: "",
//   variant: "info" as "success" | "error" | "warning" | "info",
// });

// // helper
// const showModal = (title: string, description: string, variant: "success" | "error" | "warning" | "info" = "info") => {
//   setModal({ open: true, title, description, variant });
// };

// if (formData.password !== formData.confirmPassword) {
//   toast({ title: "❌ Password Mismatch", description: "Passwords do not match.", variant: "destructive" });
//   showModal("❌ Password Mismatch", "Passwords do not match. Please check and try again.", "error");
//   return;
// }

{
  /* <NotificationModal
  open={modal.open}
  title={modal.title}
  description={modal.description}
  variant={modal.variant}
  onClose={() => setModal({ ...modal, open: false })}
/> */
}
