
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

const AdminImpersonation = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Check admin password
      if (adminPassword !== "super-admin-pass") {
        setError("Invalid admin password");
        setIsLoading(false);
        return;
      }

      // Check if user exists and get their profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, role')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        setError("User not found");
        setIsLoading(false);
        return;
      }

      // Create a temporary password for this user (we'll use the admin password)
      // This is a development hack - we're essentially creating a temporary auth session
      
      // First, let's try to sign in the user with their email
      // We'll use a workaround: create a temporary password reset for the user
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/temp-login?target=${encodeURIComponent(email)}&role=${profile.role}`
      });

      if (resetError) {
        // If password reset fails, we'll use an alternative approach
        // Create a magic link for the user
        const { error: magicError } = await supabase.auth.signInWithOtp({
          email: email,
          options: {
            shouldCreateUser: false,
            emailRedirectTo: `${window.location.origin}/admin/auto-redirect?role=${profile.role}`
          }
        });

        if (magicError) {
          setError("Unable to impersonate user. Please check if the email exists.");
          setIsLoading(false);
          return;
        }

        setError("Magic link sent to user's email. This approach requires access to their email.");
        setIsLoading(false);
        return;
      }

      setError("Password reset email sent. Check the user's email for login link.");
      
    } catch (error) {
      console.error('Admin impersonation error:', error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground">Admin Impersonation</h1>
          <p className="text-muted-foreground mt-2">Development & Testing Tool</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Impersonate User</CardTitle>
            <CardDescription>
              Enter a user's email and the admin password to log in as them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password">Admin Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="super-admin-pass"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Impersonate User"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium text-sm mb-2">Note:</h3>
              <p className="text-xs text-muted-foreground">
                This feature is for development purposes only. It uses Supabase's password reset mechanism
                which requires access to the user's email to complete the login process.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminImpersonation;
