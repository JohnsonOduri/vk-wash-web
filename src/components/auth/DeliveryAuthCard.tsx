import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DeliveryLoginForm } from "./DeliveryLoginForm";

export const DeliveryAuthCard = ({ onLogin }: { onLogin: () => void }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Staff Login</CardTitle>
        <CardDescription>
          Enter your email and password
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DeliveryLoginForm onSubmit={onLogin} />
      </CardContent>
    </Card>
  );
};
