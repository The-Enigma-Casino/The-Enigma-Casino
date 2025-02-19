import classes from './Button.module.css';

interface ButtonProps { 
  children: React.ReactNode;
  onClick: () => void;
  variant: string;
  color: string;
  font: string;
}

/**
 * Button Component
 * 
 * Este componente renderiza un botón personalizado, permitiendo diferentes variantes.
 *
 * @param {Object} props  - Propiedades del componente.
 * @param {React.ReactNode} props.children -  Contenido del botón.
 * @param {Function} props.onClick -  Función que se ejecuta al hacer click en el botón.
 * @param {string} props.variant - Variante del botón.
 * @param {string} props.color - Color del botón.
 * @param {string} props.font - Tamaño del botón.
 * 
 * @example <Button variant="small" color="green" font="medium" onClick={() => }>Soy un boton</Button>
 * 
 * @returns {JSX.Element} Componente `<Button />`.
 * 
 */
function Button({ children, onClick, variant, color, font}: ButtonProps) {
  return (
    <button 
      className={`${classes[variant]} ${classes[color]} ${classes[font]}` }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
