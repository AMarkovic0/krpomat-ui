
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Settings, Trash2 } from "lucide-react";
import { deleteMachine } from "../api";
import { refreshPage } from "../utils";

interface VendingMachineSettingsProps {
  id: string;
  initialName: string;
  initialPhone?: string;
  initialSlots: number;
  initialCompanyName: string;
  onSave?: (newSlots: number) => void;
}

export function VendingMachineSettings({
  id,
  initialName,
  initialPhone = "",
  initialSlots,
  initialCompanyName,
  onSave,
}: VendingMachineSettingsProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [slots, setSlots] = useState(initialSlots.toString());
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [open, setOpen] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and basic phone number characters
    const value = e.target.value.replace(/[^\d+\-() ]/g, '');
    setPhone(value);
  };

  const handleSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 5) {
      setSlots(e.target.value);
    }
  };

  const handleSave = () => {
    console.log("Saving settings for machine", id, {
      name,
      phone,
      slots: parseInt(slots),
      companyName,
    });
    onSave?.(parseInt(slots));
    setOpen(false);
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this machine?")) {
      await deleteMachine(id);
      setOpen(false);
      refreshPage();
    }
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
          <DialogDescription>
            Configure the vending machine settings. Click save when you're done.
          </DialogDescription>
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
            <label htmlFor="companyName" className="text-right">
              Company
            </label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="phone" className="text-right">
              Phone
            </label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+1 (234) 567-8900"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="slots" className="text-right">
              Slots (1-5)
            </label>
            <Input
              id="slots"
              value={slots}
              onChange={handleSlotsChange}
              className="col-span-3"
              type="number"
              min="1"
              max="5"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="flex items-center"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
