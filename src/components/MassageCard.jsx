import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"

export default function MassageCard({
  title,
  content,
  duration,     
  price,        
  imageUrl,
  imageAlt = "",
  isAdmin,
  onEdit,  
}) {
  return (
    <Card className="container-massagepart">
      <div className="relative">
        {/* Bouton crayon si admin */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label="Modifier le massage"
            title="Modifier le massage"
          >
            <Pencil />
          </Button>
        )}

        {/* Grille 1/3 - 2/3 */}
        <div className="container-content">
          {/* Image (1/3) */}
          <div className="container-picture">
            <img
              src={imageUrl}
              alt={imageAlt || title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Contenu (2/3) */}
          <div>
            <CardContent className="container-text">
              <h3>{title}</h3>
              <p>{content}</p>
              <div>
                <p className="duration">
                    Temps : {duration}
                </p>
                <p className="price">
                    Prix : {price}
                </p>
              </div>
            </CardContent>
          </div>
        </div>
      </div>
    </Card>
  )
}
