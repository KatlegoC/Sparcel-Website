import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ParcelMap } from "./ParcelMap";

interface MapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MapDialog({ open, onOpenChange }: MapDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 gap-0 bg-[#FF5823]">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-2xl font-bold text-white">Find Your Nearest Sparcel Point</DialogTitle>
        </DialogHeader>
        <div className="p-6 pt-2 pb-6">
          <ParcelMap />
        </div>
      </DialogContent>
    </Dialog>
  );
} 