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
  // (chrome26, uno de los 10 idiomas, como los mensajes de los avisos). También el prefijo
  // que la región viva lee antes de cada aviso y el nombre de la región (N11): sin ellos,
  // Radix dice "Notification" y "Notifications (F8)" en inglés en todos los idiomas
  const { t } = useChrome26(true)

  return (
    <ToastProvider label={t.toast.item}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {/* Espacio entre título y texto en el anuncio de la región viva (Radix junta los
                  textos: "ErrorDemasiados envíos"); en la rejilla no se pinta */}
              {title && description && " "}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose aria-label={t.header.close} />
          </Toast>
        )
      })}
      <ToastViewport label={t.toast.region} />
    </ToastProvider>
  )
}
