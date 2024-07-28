export const adjustTextAreaHeight = (event: any): void => {
  const textarea = event.target;
  textarea.style.height = 'auto'; // Revertir la altura a automático para recalcularla
  textarea.style.height = textarea.scrollHeight + 'px'; // Establecer la altura según el contenido
};
