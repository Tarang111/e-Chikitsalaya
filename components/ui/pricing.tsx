import React from 'react'
import { Card, CardContent } from './card'
import { PricingTable } from '@clerk/nextjs'

function Pricing() {
  return (
   <Card>
    <CardContent>
        <PricingTable/>
    </CardContent>
   </Card>
  )
}

export default Pricing