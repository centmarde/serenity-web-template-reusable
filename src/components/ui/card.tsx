import * as React from "react"
import { useThemeStore } from "@/stores/theme"
import { cn } from "@/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  themed?: boolean;
  themeColor?: string;
}

function Card({ className, themed = false, themeColor, ...props }: CardProps) {
  const { getCurrentThemeColor } = useThemeStore();
  
  const getThemeStyles = () => {
    if (!themed) return {};
    
    const color = themeColor || getCurrentThemeColor();
    return {
      borderColor: color,
      boxShadow: `0 4px 15px ${color}20`
    };
  };

  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        themed && "transition-all duration-200 hover:shadow-lg",
        className
      )}
      style={getThemeStyles()}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

interface CardTitleProps extends React.ComponentProps<"div"> {
  themed?: boolean;
  themeColor?: string;
}

function CardTitle({ className, themed = false, themeColor, ...props }: CardTitleProps) {
  const { getCurrentThemeColor } = useThemeStore();
  
  const getThemeStyles = () => {
    if (!themed) return {};
    
    const color = themeColor || getCurrentThemeColor();
    return {
      color: color
    };
  };

  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      style={getThemeStyles()}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

interface CardContentProps extends React.ComponentProps<"div"> {
  themed?: boolean;
  themeColor?: string;
  backgroundOpacity?: number;
}

function CardContent({ className, themed = false, themeColor, backgroundOpacity = 0.05, ...props }: CardContentProps) {
  const { getCurrentThemeColor } = useThemeStore();
  
  const getThemeStyles = () => {
    if (!themed) return {};
    
    const color = themeColor || getCurrentThemeColor();
    const opacity = Math.round(backgroundOpacity * 100).toString(16).padStart(2, '0');
    return {
      backgroundColor: `${color}${opacity}`
    };
  };

  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-6", 
        themed && "rounded-lg transition-all duration-200",
        className
      )}
      style={getThemeStyles()}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

// Themed Card variants for easy use
interface ThemedCardProps extends CardProps {
  children?: React.ReactNode;
}

function ThemedCard({ children, themeColor, className, ...props }: ThemedCardProps) {
  return (
    <Card 
      themed 
      themeColor={themeColor} 
      className={className}
      {...props}
    >
      {children}
    </Card>
  );
}

interface ThemedCardWithContentProps extends ThemedCardProps {
  title?: string;
  description?: string;
  backgroundOpacity?: number;
}

function ThemedCardWithContent({ 
  title, 
  description, 
  children, 
  themeColor, 
  backgroundOpacity = 0.1,
  className,
  ...props 
}: ThemedCardWithContentProps) {
  return (
    <ThemedCard themeColor={themeColor} className={className} {...props}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle themed themeColor={themeColor}>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent themed themeColor={themeColor} backgroundOpacity={backgroundOpacity}>
        {children}
      </CardContent>
    </ThemedCard>
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  ThemedCard,
  ThemedCardWithContent,
}
