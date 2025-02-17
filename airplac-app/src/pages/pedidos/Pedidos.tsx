import React from "react";

import Table from "../../componets/TablePedidos";

const Pedidos: React.FC = () => {
  // Usa el estado del contexto

  return (
    <div className="relative">
      <Table />
    </div>
  );
};

export default Pedidos;
