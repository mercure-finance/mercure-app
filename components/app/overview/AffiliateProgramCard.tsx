import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PiggyBankIcon } from "lucide-react";

const AffiliateProgram = () => (
  <Card className="mt-2">
    <CardHeader>
      <CardTitle className="">Get a FREE Stock!</CardTitle>
      <CardDescription className="">
        Earn a Stock for completely free every time someone signs up with your
        refferral Code and makes their first trade !
      </CardDescription>
      <div className="">
        <Button className="p-4 bg-indigo-600">Referral Program</Button>
      </div>
    </CardHeader>
  </Card>
);

export default AffiliateProgram;
