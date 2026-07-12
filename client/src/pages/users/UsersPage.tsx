import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Copy,
  MoreHorizontal,
  Plus,
  ShieldCheck,
  ShieldOff,
  Trash2,
} from "lucide-react";
import type { AppUser } from "@ijp/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/providers/AuthProvider";
import {
  deleteUser,
  fetchUsers,
  requestPasswordReset,
  setUserStatus,
} from "@/api/users";
import { CreateUserDialog } from "./CreateUserDialog";

export function UsersPage() {
  const { profile: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [userPendingDelete, setUserPendingDelete] = useState<AppUser | null>(
    null,
  );
  const [resetLink, setResetLink] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const statusMutation = useMutation({
    mutationFn: ({ uid, disabled }: { uid: string; disabled: boolean }) =>
      setUserStatus(uid, disabled),
    onSuccess: (_data, variables) => {
      toast.success(variables.disabled ? "User disabled." : "User enabled.");
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not update the user.",
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (uid: string) => deleteUser(uid),
    onSuccess: () => {
      toast.success("User deleted.");
      setUserPendingDelete(null);
      void queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Could not delete the user.",
      );
    },
  });

  const resetMutation = useMutation({
    mutationFn: (email: string) => requestPasswordReset(email),
    onSuccess: (result) => setResetLink(result.resetLink),
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not generate a reset link.",
      );
    },
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage who can access the IJP HR CMS Manager.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus />
          Create User
        </Button>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  Could not load users.
                </TableCell>
              </TableRow>
            ) : data && data.items.length > 0 ? (
              data.items.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell className="font-medium">
                    {user.displayName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role === "admin" ? "Admin" : "HR"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.disabled ? "destructive" : "success"}>
                      {user.disabled ? "Disabled" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal />
                          <span className="sr-only">Open actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => resetMutation.mutate(user.email)}
                        >
                          <Copy />
                          Reset Password
                        </DropdownMenuItem>
                        {user.uid !== currentUser?.uid && (
                          <DropdownMenuItem
                            onClick={() =>
                              statusMutation.mutate({
                                uid: user.uid,
                                disabled: !user.disabled,
                              })
                            }
                          >
                            {user.disabled ? <ShieldCheck /> : <ShieldOff />}
                            {user.disabled ? "Enable" : "Disable"}
                          </DropdownMenuItem>
                        )}
                        {user.uid !== currentUser?.uid && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setUserPendingDelete(user)}
                          >
                            <Trash2 />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />

      <AlertDialog
        open={userPendingDelete !== null}
        onOpenChange={(open) => !open && setUserPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes &quot;{userPendingDelete?.displayName}
              &quot;&apos;s access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={() =>
                userPendingDelete &&
                deleteMutation.mutate(userPendingDelete.uid)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={resetLink !== null}
        onOpenChange={(open) => !open && setResetLink(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Password reset link</DialogTitle>
            <DialogDescription>
              Firebase doesn&apos;t send this automatically — copy the link and
              share it with the user directly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={resetLink ?? ""}
              onFocus={(event) => event.currentTarget.select()}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => {
                if (resetLink) {
                  void navigator.clipboard.writeText(resetLink);
                  toast.success("Copied to clipboard.");
                }
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <DialogFooter>
            <Button onClick={() => setResetLink(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
