import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getLoginLogsLastDays, LoginLog } from "@/services/loginLogService";
import { toast } from "@/hooks/use-toast";
import { Shield, RefreshCcw } from "lucide-react";
import { setUserPassword } from "@/services/adminUserService";

interface AdminActivityPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  adminEmail?: string;
}

const AdminActivityPanel = ({ open, onOpenChange, adminEmail }: AdminActivityPanelProps) => {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await getLoginLogsLastDays(5);
      setLogs(data || []);
    } catch (err) {
      toast({
        title: "Activity error",
        description: "Unable to load login activity right now.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open]);

  useEffect(() => {
    if (!email && adminEmail) {
      setEmail(adminEmail);
    }
  }, [email, adminEmail]);

  const formatDate = (value?: number) => {
    if (!value) return "-";
    return format(new Date(value), "dd MMM yyyy, HH:mm");
  };

  const handlePasswordChange = async () => {
    if (!email) {
      toast({
        title: "Email required",
        description: "Enter the email to update the password for.",
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

    setUpdatingPassword(true);
    try {
      await setUserPassword({ email, newPassword });
      toast({
        title: "Password updated",
        description: "The password was updated successfully.",
      });
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.message || "Unable to update password.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const logRows = useMemo(() => logs, [logs]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-indigo-500" />
            Activity & Security
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={fetchLogs}>
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          <div className="rounded-lg border bg-white">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h3 className="font-semibold">Login activity (last 5 days)</h3>
                <p className="text-xs text-gray-500">Tracks which emails logged in each day.</p>
              </div>
              <Badge className="bg-indigo-100 text-indigo-700">{logs.length} entries</Badge>
            </div>
            <div className="p-4">
              {loading ? (
                <div className="text-sm text-gray-500">Loading activity...</div>
              ) : logRows.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Login time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logRows.map((log) => (
                      <TableRow key={log.id || `${log.email}-${log.loggedAt?.toISOString()}`}>
                        <TableCell className="font-medium">{log.email || "-"}</TableCell>
                        <TableCell>{log.deviceInfo || "-"}</TableCell>
                        <TableCell className="text-sm">{formatDate(log.loggedAt ? log.loggedAt.getTime() : undefined)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-sm text-gray-500">No login activity in the last 5 days.</div>
              )}
            </div>
          </div>

          <div className="rounded-lg border bg-white">
            <div className="px-4 py-3 border-b">
              <h3 className="font-semibold">Change password</h3>
              <p className="text-xs text-gray-500">Update admin credentials with a fresh password.</p>
            </div>
            <div className="p-4 grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email</Label>
                <Input id="admin-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <div className="md:col-span-3 flex justify-end">
                <Button onClick={handlePasswordChange} disabled={updatingPassword}>
                  Update password
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminActivityPanel;
