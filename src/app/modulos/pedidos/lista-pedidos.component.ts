import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbDatepickerConfig, NgbDateStruct, NgbDropdownConfig } from '@ng-bootstrap/ng-bootstrap';

import { Paginacion } from '../../entidades/entidad.paginacion';
import { PedidosService } from './servicios/pedidos.service'

@Component({
  selector: 'app-lista-pedidos',
  templateUrl: './lista-pedidos.component.html',
  styleUrls: ['./lista-pedidos.component.css'],
  providers: [NgbDatepickerConfig, NgbDropdownConfig]
})
export class ListaPedidosComponent implements OnInit {

  public languaje = 'es';
  public pedidos: any = [];
  public page: number = 1;
  public paginacion:Paginacion;
  public desde:NgbDateStruct;
  public hasta:NgbDateStruct;

  public solicitando = false;
  public solicitudExitosa = false;
  public mensajeForUser = '';
  public parametros: any = {};

  constructor(
    private router: Router,
    private pedidosService: PedidosService
  ) {
    this.paginacion = new Paginacion();
  }

  ngOnInit() {
    this.traerPedidos();
  }

  busqueda(): void {
    this.page = 1;
    this.parametros = {
      "desde": new Date(this.desde ? this.desde.year+'/'+this.desde.month+'/'+this.desde.day : ""),
      "hasta": new Date(this.hasta ? this.hasta.year+'/'+this.hasta.month+'/'+this.hasta.day : "")
    };
    this.traerPedidos();
  }

  traerPedidos(parametros:any=this.parametros): void {
    this.solicitando = true;
    this.pedidosService.getLista(this.page, this.paginacion.cantidadPorPagina, parametros)
      .then(data => {
        if(data !== undefined){
          this.solicitando = false;
          this.solicitudExitosa = true;
          this.paginacion.totalRegistros = data.totalRegistros;
          this.paginacion.paginaActual = data.paginaActual;
          this.paginacion.totalPaginas = data.totalPaginas;
          this.pedidos = data.registros;
        }
      })
      .catch(err => this.usarStorage(err));
  }

  nuevoPedido(){
     this.router.navigate(["./pedidos/formulario"]);
  }

  private handleError(error: any): void {
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.mensajeForUser = 'Ups Error';
  }

  usarStorage(err){
    if(err.status == 0 || err.status == 504){
      this.solicitando = false;
      this.pedidos = JSON.parse(localStorage.getItem("pedidos"))
    } else {
      this.handleError(err);
    }
  }

}
