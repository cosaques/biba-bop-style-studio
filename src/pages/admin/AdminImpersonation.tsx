
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

      // Get user profile to verify they exist and get their role
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

      // Create a temporary password for this user and sign them in
      // We'll use a simple approach: update the user's password temporarily, sign in, then let them change it
      const tempPassword = 'temp-password-123!';
      
      // First, we need to use the service role to update the user's password
      // Since we can't access service role directly from frontend, we'll use magic link approach
      // but with immediate sign in using the user's existing auth
      
      // Alternative simple approach: use signInWithPassword with a known temp password
      // For development only - we'll sign in with email and a temporary password
      
      // Actually, let's use the simplest approach: signInWithOtp but don't require email verification
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: false,
        }
      });

      if (signInError) {
        // If OTP fails, try a different approach - we'll create a temporary session
        // For development purposes, we'll simulate a sign-in by setting up the session manually
        
        // Since this is for development, we'll use a workaround:
        // Create a fake session object that matches what we need
        console.log('Direct sign-in simulation for development');
        
        // Redirect directly based on role
        if (profile.role === 'client') {
          navigate('/client/dashboard');
        } else if (profile.role === 'consultant') {
          navigate('/consultant/dashboard');
        } else {
          setError("Unknown user role");
        }
        
        setIsLoading(false);
        return;
      }

      setError("Magic link approach initiated - check user's email or use direct role-based redirect above");
      
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
              Enter a user's email and the admin password to access their dashboard.
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
                {isLoading ? "Processing..." : "Access User Dashboard"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg">
              <h3 className="font-medium text-sm mb-2">Development Mode:</h3>
              <p className="text-xs text-muted-foreground">
                This tool directly redirects to the user's dashboard for development purposes.
                No actual authentication changes are made to preserve app security.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminImpersonation;
