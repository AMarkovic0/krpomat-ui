import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Settings } from "lucide-react";
import MuiPhoneNumber, { MaterialPhoneNumberProps } from "mui-phone-number";

interface VendingMachineSettingsProps {
  id: string;
  initialName: string;
  initialPhone?: string;
  initialSlots: number;
  onSave?: (newSlots: number) => void;
}

export function VendingMachineSettings({
  id,
  initialName,
  initialPhone = "",
  initialSlots,
  onSave,
}: VendingMachineSettingsProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [slots, setSlots] = useState(initialSlots.toString());
  const [open, setOpen] = useState(false);

  const handlePhoneChange = (value: string) => {
    setPhone(value);
  };

  const handleSave = () => {
    console.log("Saving settings for machine", id, {
      name,
      phone,
      slots: parseInt(slots),
    });
    onSave?.(parseInt(slots));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Machine Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="name" className="text-right">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="phone" className="text-right">
              Phone
            </label>
            <div className="col-span-3">
              <MuiPhoneNumber
                defaultCountry="rs"
                value={phone}
                onChange={handlePhoneChange as MaterialPhoneNumberProps['onChange']}
                variant="outlined"
                fullWidth
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="slots" className="text-right">
              Slots
            </label>
            <Input
              id="slots"
              value={slots}
              onChange={(e) => setSlots(e.target.value)}
              className="col-span-3"
              type="number"
              min="1"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}