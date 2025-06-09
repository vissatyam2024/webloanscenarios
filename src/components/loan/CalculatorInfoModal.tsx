// src/components/loan/CalculatorInfoModal.tsx

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
  import { Info } from "lucide-react"
  
  export function CalculatorInfoModal() {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <button className="inline-flex items-center hover:text-gray-600">
            <Info className="w-5 h-5 ml-2" />
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>What can this calculator do?</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div>
              <h3 className="font-semibold mb-2">Compare & Save</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• See potential savings with lower interest rates</li>
                <li>• Understand the impact of optimizing your loan</li>
                <li>• Choose between lower EMI or shorter tenure</li>
              </ul>
            </div>
  
            <div>
              <h3 className="font-semibold mb-2">Plan Smarter Payments</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Calculate impact of extra payments</li>
                <li>• See reduction in loan tenure and interest</li>
                <li>• Compare monthly, quarterly, or yearly prepayment options</li>
              </ul>
            </div>
  
            <div>
              <h3 className="font-semibold mb-2">Make Better Decisions</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Evaluate refinancing opportunities</li>
                <li>• Plan your prepayment strategy</li>
                <li>• Understand the true cost of your loan</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }
