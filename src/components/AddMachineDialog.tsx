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
import { Plus } from "lucide-react";

interface AddMachineDialogProps {
  onConfirm: (machine: {
    userName: string;
    name: string;
    id: string;
    totalSlots: number;
    phone: string;
    companyName: string;
  }) => void;
}

export function AddMachineDialog({ onConfirm }: AddMachineDialogProps) {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [machineName, setMachineName] = useState("");
  const [machineId, setMachineId] = useState("");
  const [slots, setSlots] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d+\-() ]/g, '');
    setPhone(value);
  };

  const handleSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= 5) {
      setSlots(e.target.value);
    }
  };

  const handleConfirm = () => {
    onConfirm({
      userName,
      name: machineName,
      id: machineId,
      totalSlots: parseInt(slots),
      phone,
      companyName,
    });
    setOpen(false);
    // Reset form
    setUserName("");
    setMachineName("");
    setMachineId("");
    setSlots("");
    setPhone("");
    setCompanyName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative bg-white">
          <Plus className="h-5 w-5 text-green-500" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Vending Machine</DialogTitle>
          <DialogDescription>
            Fill in the details for the new vending machine. Click confirm when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="userName" className="text-right">
              User Name
            </label>
            <Input
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="machineName" className="text-right">
              Machine Name
            </label>
            <Input
              id="machineName"
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="companyName" className="text-right">
              Company Name
            </label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="machineId" className="text-right">
              Machine ID
            </label>
            <Input
              id="machineId"
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="slots" className="text-right">
              Slots (1-5)
            </label>
            <Input
              id="slots"
              type="number"
              min="1"
              max="5"
              value={slots}
              onChange={handleSlotsChange}
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
        </div>
        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Confirm</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}