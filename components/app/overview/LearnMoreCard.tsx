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

const LearnMore = () => (
  <Card className="mt-4 bg-indigo-600">
    <CardHeader>
      <div className="flex items-center">
        <div className="rounded-full bg-white items-center justify-center p-3">
          <PiggyBankIcon className="left-0" />
        </div>
        <CardTitle className="text-white ml-2">Learn More</CardTitle>
      </div>
      <CardDescription className="text-slate-100">
        Want to learn how Mercure works ?
      </CardDescription>
      <div className="">
        <Button variant="secondary">Take me there</Button>
      </div>
    </CardHeader>
  </Card>
);

export default LearnMore;
