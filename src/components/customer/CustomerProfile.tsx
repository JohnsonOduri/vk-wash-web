
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { User, Phone, MapPin, Edit } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from '@/hooks/use-toast';
import { doc, updateDoc } from "firebase/firestore";
import { db } from '@/lib/firebase';

interface CustomerProfileProps {
  user: {
    id: string;
    phone?: string;
    uniqueId?: string;
    name?: string;
    address?: string;
    email?: string;
  } | null;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.string().min(10, "Address must be at least 10 characters"),
});

type ProfileValues = z.infer<typeof profileSchema>;

const CustomerProfile = ({ user }: CustomerProfileProps) => {
  const [editing, setEditing] = useState(false);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
    },
  });

  const onSubmit = async (data: ProfileValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update user profile in Firestore
      await updateDoc(doc(db, "users", user.id), {
        name: data.name,
        phone: data.phone,
        address: data.address,
      });

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated",
      });
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>View and update your personal information</CardDescription>
            </div>
            {!editing && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <User className="text-muted-foreground h-5 w-5" />
                          <Input placeholder="Enter your full name" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Phone className="text-muted-foreground h-5 w-5" />
                          <Input placeholder="Enter your phone number" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <MapPin className="text-muted-foreground h-5 w-5" />
                          <Input placeholder="Enter your address" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" type="button" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </Form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start space-x-4 py-2">
                <User className="text-blue h-5 w-5 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="text-lg">{user?.name || "Not set"}</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 py-2">
                <Phone className="text-blue h-5 w-5 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Phone Number</div>
                  <div className="text-lg">{user?.phone || "Not set"}</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 py-2">
                <MapPin className="text-blue h-5 w-5 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Address</div>
                  <div className="text-lg">{user?.address || "Not set"}</div>
                </div>
              </div>

              <div className="flex items-start space-x-4 py-2">
                <Mail className="text-blue h-5 w-5 mt-1" />
                <div>
                  <div className="text-sm font-medium text-gray-500">Email</div>
                  <div className="text-lg">{user?.email || "Not set"}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your unique VK Wash account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 py-2">
              <div className="bg-blue text-white p-2 rounded-full">
                <User className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-medium text-gray-500">Customer ID</div>
                <div className="text-lg font-mono">{user?.phone || user?.uniqueId}</div>
                <div className="text-sm text-gray-500 mt-1">
                  Use this ID when communicating with customer service
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;
