import type { CategoryGroup } from "../types/products";

const raw = {
  refaccionaria_catalogo: [
    {
      categoria: "Frenos",
      subcategorias: [
        "Mangueras frenos",
        "Kit herrajes para frenos",
        "Cilindros de freno",
        "Bombas de frenos",
        "Rotores de freno",
        "Balatas"
      ]
    },
    {
      categoria: "Sistema de Enfriamiento y Motor",
      subcategorias: [
        "Valvulas PCV",
        "Valvulas IAC",
        "Bombas de agua",
        "Tomas de agua",
        "Termostatos",
        "Mangueras para radiador",
        "Tapones radiador / gasolina",
        "Soportes de motor",
        "Partes internas motor a diesel",
        "Partes internas motor a gasolina",
        "Refacciones perifericas gasolina",
        "Refacciones perifericas diesel"
      ]
    },
    {
      categoria: "Transmision, Suspension y Direccion",
      subcategorias: [
        "Kit clutch",
        "Soportes de transmision",
        "Amortiguadores",
        "Suspension",
        "Baleros",
        "Repuesto chumaceras",
        "Mangueras de direccion hidraulica"
      ]
    },
    {
      categoria: "Sistema Electrico, Sensores e Encendido",
      subcategorias: [
        "Bujias moto",
        "Bujias auto y camioneta",
        "Cables bujia",
        "Bobinas",
        "Rotores y tapas de distribuidor",
        "Sensores temperatura",
        "Sensores arbol",
        "Sensores MAF",
        "Sensores varios",
        "Baterias auto y camioneta",
        "Baterias servicio pesado",
        "Baterias moto"
      ]
    },
    {
      categoria: "Sistema de Combustible",
      subcategorias: ["Bombas de diesel", "Repuestos bomba de gasolina"]
    },
    {
      categoria: "Filtros, Aceites, Fluidos y Quimicos",
      subcategorias: [
        "Filtros de transmision automatica",
        "Filtros de gasolina",
        "Filtros para diesel",
        "Filtros aire servicio ligero",
        "Filtros aire servicio pesado",
        "Filtros aire agricola",
        "Filtros aceite servicio ligero",
        "Filtros aceite servicio pesado",
        "Filtros / aceite hidraulico",
        "Aceites",
        "Cubetas aceite para motor a diesel",
        "Cubetas aceite para transmision",
        "Cubetas aceite hidraulico",
        "Grasas",
        "Aditivos",
        "Aromatizantes"
      ]
    },
    {
      categoria: "Llantas, Camaras y Rines",
      subcategorias: [
        "Llantas auto y camioneta",
        "Llantas camion",
        "Llantas agricolas",
        "Llantas industriales",
        "Llantas moto",
        "Camaras auto y camioneta",
        "Camaras agricolas",
        "Camaras industriales"
      ]
    },
    {
      categoria: "Sistema Hidraulico",
      subcategorias: [
        "Conexiones hidraulicas",
        "Mangueras hidraulicas",
        "Adaptadores hidraulicos"
      ]
    },
    {
      categoria: "Bandas, Empaques y Retenes",
      subcategorias: [
        "Bandas Poly V",
        "Bandas A, B, C",
        "Retenes",
        "Empaques servicio ligero",
        "Empaques servicio pesado"
      ]
    },
    {
      categoria: "Tornilleria y Herramientas",
      subcategorias: [
        "Dados impacto",
        "Dados normales",
        "Tornillos milimetrico",
        "Tornillos estandar",
        "Tornillos Allen"
      ]
    },
    {
      categoria: "Remolques e Implementos Agricolas",
      subcategorias: ["Refacciones remolque", "Implementos agricolas"]
    }
  ]
};

export const CATALOG: CategoryGroup[] = raw.refaccionaria_catalogo.map(
  ({ categoria, subcategorias }) => ({
    category: categoria,
    subcategories: subcategorias
  })
);
