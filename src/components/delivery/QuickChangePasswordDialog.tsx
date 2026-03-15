import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { updatePassword } from "firebase/auth";

const VERIFICATION_CODE = "VKwash@PasswordChange";

interface QuickChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
}

const QuickChangePasswordDialog = ({ open, onOpenChange, email }: QuickChangePasswordDialogProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    if (verificationCode !== VERIFICATION_CODE) {
      toast({
        title: "Invalid verification code",
        description: "Please enter the correct verification password.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword.length < 8) {
      toast({
        title: "Weak password",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (!auth.currentUser) {
      toast({
        title: "Not signed in",
        description: "Please log in again to update your password.",
        variant: "destructive",
      });
      return;
    }

    setUpdating(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast({
        title: "Password updated",
        description: "Your password was updated successfully.",
      });
      setVerificationCode("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message || "Unable to update password.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="verification-code">Verification password</Label>
            <Input
              id="verification-code"
              type="password"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm new password</Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={handleUpdate} disabled={updating}>
              Update password
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickChangePasswordDialog;
