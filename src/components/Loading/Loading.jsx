import { motion } from "framer-motion";
import "tailwindcss/tailwind.css";

export default function LoadingAnimation() {
  return (
    <div className="w-full bg-white">
    <div className="flex items-center justify-center text-center rounded-fullxl  bg-gradient-to-br from-blue-500 to-green-400">
      <motion.svg
        viewBox="0 0 200 200"
        className="w-40 h-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4 }}
        delay={2}
      >
        <motion.path
          d="M52, 116.125 L15,90 L100,10 L170,90 L135.20000076293945,110.2499694824219 L155,150 L170,170 L140,170 L155,150 )"
          stroke="white"
          strokeWidth="5"
          fill="transparent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1,delay:5, repeat: Infinity, repeatType: "reverse" }}
        />
        
        <motion.path
  d="M60,140 L55,70 C80,120 82,123 110,110 Q122,30 120,145 "
  stroke="white"
  strokeWidth="5"
  fill="transparent"
  initial={{ pathLength: 0 }}
  animate={{ pathLength: 1 }}
  transition={{ duration: 2, delay:2, repeat: Infinity, repeatType: "reverse" }}
/>
        <motion.path
          d="M51,66 C70,60 120,50 120,60  "
          stroke="white"
          strokeWidth="7"
          fill="transparent"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2 ,delay:2,  repeat: Infinity, repeatType: "reverse" }}
        />
        


<circle cx="52" cy="116.125" r="3" fill="blue" />
<circle cx="15" cy="90" r="3" fill="blue" />
<circle cx="100" cy="10" r="3" fill="blue" />
<circle cx="170" cy="90" r="3" fill="blue" />
<circle cx="135.2" cy="110.2" r="3" fill="blue" />
<circle cx="155" cy="150" r="3" fill="green" />
<circle cx="170" cy="170" r="3" fill="green" />
<circle cx="140" cy="170" r="3" fill="green" />
<circle cx="95" cy="110" r="3" fill="green" />
<circle cx="100" cy="145" r="3" fill="green" />
<circle cx="59" cy="70" r="3" fill="green" />
<circle cx="80" cy="120" r="3" fill="balck" />

<circle cx="83" cy="123" r="3" fill="green" />






      </motion.svg>
    </div>
    </div>
  );
}
