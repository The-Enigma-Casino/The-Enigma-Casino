import classes from './Button.module.css';

interface ButtonProps { 
  children: React.ReactNode;
  onClick: () => void;
  variant: string;
  color: string;
}

/**
 * Button Component
 * 
 * Este componente renderiza un botón personalizado, permitiendo diferentes variantes.
 *
 * @param {Object} props - Propiedades para configurar el componente.
 * @param {React.ReactNode} props.children - Contenido.
 * @param {Function} props.onClick - Función que se ejecuta.
 * @param {string} props.variant - Tamaño (`short`, `large`, `medium`).
 * @param {string} props.color - Color (`azul`, `morado`, `azul-morado`, `morado-azul`).
 * 
 * @returns {JSX.Element} Componente `<Button />`.
 * 
 * @example
 * <Button variant="short" color="azul" onClick={function}>Texto</Button>
 */
function Button({ children, onClick, variant, color}: ButtonProps) {
  return (
    <button 
      className={`${classes[variant]} ${classes[color]}` }
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
