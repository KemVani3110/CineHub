'use client';

import Image from 'next/image';

interface LoadingProps {
 message?: string;
 showBackdrop?: boolean;
}

const Loading = ({ message = 'Loading...', showBackdrop = true }: LoadingProps) => {
 return (
   <div className={`${showBackdrop ? 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50' : ''} flex items-center justify-center min-h-[300px]`}>
     <div className="flex flex-col items-center justify-center gap-6">
       <div className="relative">
         {/* Spinner ring outside */}
         <div className="w-24 h-24 rounded-full border-6 border-primary/30 border-t-primary animate-spin"></div>
         
         {/* Middle Logo*/}
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
           <Image
             src="/logo.png"
             alt="CineHub Logo"
             width={60}
             height={60}
             className="animate-pulse rounded-full"
           />
         </div>
       </div>
       
       <p className="text-text-sub text-lg font-medium animate-pulse">
         {message}
       </p>
     </div>
   </div>
 );
};

export default Loading;