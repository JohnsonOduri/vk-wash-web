
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { toast } from "@/hooks/use-toast";
import { Mail, User, Key, Phone, MapPin } from "lucide-react";
import Navigation from "@/components/Navigation";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const deliveryLoginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type DeliveryLoginValues = z.infer<typeof deliveryLoginSchema>;

const Login = () => {
  const { loginWithEmail, registerWithEmail } = useFirebaseAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginError, setLoginError] = useState("");
  
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
  });

  const deliveryLoginForm = useForm<DeliveryLoginValues>({
    resolver: zodResolver(deliveryLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onCustomerLoginSubmit = async (data: LoginValues) => {
    setLoginError("");
    try {
      const success = await loginWithEmail(data.email, data.password);
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome to VK Wash",
        });
        navigate("/customer-dashboard");
      } else {
        setLoginError("Invalid credentials or account not found. New user? Please sign up.");
        toast({
          title: "Login Failed",
          description: "Invalid credentials or account not found",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        setLoginError("Account not found. New user? Please sign up.");
      } else {
        setLoginError("Invalid credentials or account not found. New user? Please sign up.");
      }
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const onCustomerRegisterSubmit = async (data: RegisterValues) => {
    try {
      // Register with email and password, and set role to "customer"
      const success = await registerWithEmail(
        data.email, 
        data.password, 
        "customer", 
        {
          name: data.name,
          phone: data.phone,
          address: data.address
        }
      );
      
      if (success) {
        toast({
          title: "Registration Successful",
          description: `Welcome to VK Wash! Your customer ID is: ${data.phone}`,
        });
        navigate("/customer-dashboard");
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const onDeliveryLoginSubmit = async (data: DeliveryLoginValues) => {
    try {
      const success = await loginWithEmail(data.email, data.password);
      if (success) {
        // Check if the user has the correct role
        const user = useFirebaseAuth().user;
        if (user && user.role === "delivery") {
          toast({
            title: "Login Successful",
            description: "Welcome to VK Wash Delivery",
          });
          navigate("/delivery-dashboard");
        } else {
          toast({
            title: "Access Denied",
            description: "This account doesn't have delivery staff permissions",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customer">Customer</TabsTrigger>
              <TabsTrigger value="delivery">Delivery Staff</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer">
              <Card>
                <CardHeader>
                  <CardTitle>{isRegistering ? "Customer Registration" : "Customer Login"}</CardTitle>
                  <CardDescription>
                    {isRegistering 
                      ? "Create a new customer account" 
                      : "Sign in with your email and password"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isRegistering ? (
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onCustomerRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <User className="text-muted-foreground" />
                                  <Input placeholder="Your full name" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Mail className="text-muted-foreground" />
                                  <Input placeholder="youremail@example.com" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Phone className="text-muted-foreground" />
                                  <Input placeholder="+91 9999999999" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <MapPin className="text-muted-foreground" />
                                  <Input placeholder="Your full address" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Key className="text-muted-foreground" />
                                  <Input type="password" placeholder="******" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Key className="text-muted-foreground" />
                                  <Input type="password" placeholder="******" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="submit" className="w-full">
                          Register
                        </Button>
                        <div className="text-center mt-4">
                          <button 
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => {
                              setIsRegistering(false);
                              setLoginError("");
                              registerForm.reset();
                            }}
                          >
                            Already have an account? Login
                          </button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onCustomerLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Mail className="text-muted-foreground" />
                                  <Input placeholder="youremail@example.com" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <div className="flex items-center space-x-2">
                                  <Key className="text-muted-foreground" />
                                  <Input type="password" placeholder="******" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {loginError && (
                          <div className="text-sm text-red-500">{loginError}</div>
                        )}
                        <Button type="submit" className="w-full">
                          Log in
                        </Button>
                        <div className="text-center mt-4">
                          <button 
                            type="button"
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => {
                              setIsRegistering(true);
                              setLoginError("");
                              loginForm.reset();
                            }}
                          >
                            New customer? Register here
                          </button>
                        </div>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="delivery">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Staff Login</CardTitle>
                  <CardDescription>
                    Enter your email and password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...deliveryLoginForm}>
                    <form onSubmit={deliveryLoginForm.handleSubmit(onDeliveryLoginSubmit)} className="space-y-4">
                      <FormField
                        control={deliveryLoginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Mail className="text-muted-foreground" />
                                <Input placeholder="youremail@example.com" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={deliveryLoginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="flex items-center space-x-2">
                                <Key className="text-muted-foreground" />
                                <Input type="password" placeholder="******" {...field} />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full">
                        Log in
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Login;
