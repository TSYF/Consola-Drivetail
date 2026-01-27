"use client";

import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { ToastContent } from "@/components/ui/toast-content";

export default function LoginPage() {
  const { register, handleSubmit } = useForm();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [response, setResponse] = React.useState({ token: null });

  const handleLogin = async (data: unknown) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      // Check for errors including non-admin access
      if (!res.ok || result.error) {
        toast(
          <ToastContent
            title="Error de inicio de sesión"
            description={result.error || "Credenciales inválidas"}
          />,
          {
            type: "error",
            autoClose: 5000,
          },
        );
        return;
      }

      setResponse(result);
      if (result.token) {
        document.cookie = `auth_token=${result.token}; path=/; max-age=86400`;
      }
      toast(
        <ToastContent
          title="Login exitoso"
          description="Bienvenido a la Consola de DriveTail"
        />,
        {
          type: "success",
          autoClose: 3000,
        },
      );
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      toast(
        <ToastContent
          title="Error de inicio de sesión"
          description={err instanceof Error ? err.message : "Error desconocido"}
        />,
        {
          type: "error",
          autoClose: 3000,
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold">DriveTail</h1>
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center">
            Ingresa tus credenciales para acceder al panel de administración
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@drivetail.com"
                {...register("email")}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
