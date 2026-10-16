import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useChrome26 } from "@/components/home26/chrome26"

export function Toaster() {
  const { toasts } = useToast()
  // Nombre del botón de cerrar en el idioma activo, el mismo "Cerrar" de la cabecera
  // (chrome26, uno de los 10 idiomas, como los mensajes de los avisos)
  const { t } = useChrome26(true)

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose aria-label={t.header.close} />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
