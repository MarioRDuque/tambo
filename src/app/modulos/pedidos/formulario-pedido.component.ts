import { Component, OnInit, ViewChild, NgZone, ElementRef, NgModule} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NguiMapModule } from '@ngui/map';
import { ChangeDetectorRef} from '@angular/core';
import { SourceCodeService } from '../../source-code.service';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";

import { NgbDatepickerConfig, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';

import{ ModalConfirmacionComponent } from './../../componentes/modal-confirmacion.component';
import{ ClienteComponent } from './../../componentes/cliente/cliente.component';
import{ ProductosComponent } from './../../componentes/productos/productos.component';

import { PedidosService } from './servicios/pedidos.service';

const NOW = new Date();

@Component({
  selector: 'app-formulario-pedido',
  templateUrl: './formulario-pedido.component.html',
  styleUrls: ['./formulario-pedido.component.css'],
  providers: [NgbDatepickerConfig]
})

export class FormularioPedidoComponent implements OnInit {

  autocomplete: any;
  address: any = {};
  center: any;
  code: string;
  precioPorunidad:number = 0;

  public pedido: any = {
    "idcliente":{
      "idpersona":{}
    },
    "detallePedidoList": []
  };
  public idPedido : number;
  public titulo:string = "NUEVO PEDIDO";
  public esEdicion:boolean = false;
  public cargando:boolean = false;
  public cliente: any = {
    "idpersona":{
      "idtipodocumento":{}
    }
  };
  public solicitando = false;
  public solicitudExitosa = false;
  public mensajeForUser = '';
  public productos : any = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private eventosService: PedidosService,
    private modalService: NgbModal,
    private ref: ChangeDetectorRef,
    public sc: SourceCodeService
  ) {
    sc.getText('PlacesAutoCompleteComponent').subscribe(text => this.code = text);
  }

  ngOnInit() {
    this.cargando = true;
    this.route.params.subscribe(params => {
        if(params['id']!=null){
            this.idPedido = +params['id'];
            this.esEdicion = true;
            this.traerPedido();
        }
        else{
          this.cargando = false;
        }
     });
  }

  initialized(autocomplete: any) {
    this.autocomplete = autocomplete;
  }

  placeChanged(place) {
    this.center = place.geometry.location;
    for (let i = 0; i < place.address_components.length; i++) {
      let addressType = place.address_components[i].types[0];
      this.address[addressType] = place.address_components[i].long_name;
    }
    this.ref.detectChanges();
  }

  abrirClientes():void{
    const modalRef = this.modalService.open(ClienteComponent, { size: 'lg', keyboard: false});
    modalRef.componentInstance.isModal = true;
    modalRef.result.then((result) => {
      this.ngOnInit();
    }, (reason) => {
      this.pedido.idcliente = reason ? reason : this.pedido.idcliente;
    });
  }

  confirmarEliminacionDetalle(o):void{
    const modalRef = this.modalService.open(ModalConfirmacionComponent);
    modalRef.result.then((result) => {
      this.eliminarDetalle(o);
    }, (reason) => {
    });
  }

  eliminarDetalle(o){
    if(o.id){
      this.solicitando = true;
      this.eventosService.eliminarDetalle(o.id)
        .then(data => {
          if(data.extraInfo){
            this.toastr.success(data.operacionMensaje, 'Exito');
            this.pedido.detallePedidoList.splice(this.pedido.detallePedidoList.indexOf(o),1);
          } else {
            this.toastr.error(data.operacionMensaje, 'Error');
          }
          this.solicitando = false;
          this.solicitudExitosa = true;
        })
        .catch(err => this.handleError(err));
    } else {
      this.pedido.detallePedidoList.splice(this.pedido.detallePedidoList.indexOf(o),1);
    }
  }

  abrirProductos():void{
    const modalRef = this.modalService.open(ProductosComponent, { size: 'lg', keyboard: false});
    modalRef.componentInstance.isModalProducto = true;
    modalRef.result.then((result) => {
      this.ngOnInit();
    }, (reason) => {
      if(reason && reason.id){
        let detalle = {
          "idproducto":reason,
          "idunidad":reason && reason.productomedidaList[0] ? reason.productomedidaList[0].idunidadmedida : {},
          "idpedido":this.pedido.id,
          "moneda":{
            "id":1,
            "simbolo":"S/."
          },
          "estado":true,
          "preciounitario":reason.productomedidaList[0].precio
        };
        this.pedido.detallePedidoList.push(detalle);
      }
    });
  }

  obtenerPrecio(detalle){
    let producto = detalle.idproducto;
    let pm = producto.productomedidaList;
    let unidad = detalle.idunidad;
    let pmSelect = pm.find(item => item.idunidadmedida.id === unidad.id);
    detalle.preciounitario = pmSelect.precio;
  }

  traerPedido(id:number=this.idPedido,ruta:string='/pedidos/obtenerEntidad'): void {
    this.solicitando = true;
    this.titulo = "EDICION DE PEDIDO N° "+id;
    this.eventosService.obtener(id,ruta)
      .then(data => {
        if(data.extraInfo){
          this.pedido = data.extraInfo;
          this.llenarDatosParaEdicion(this.pedido);
        } else {
          this.toastr.error(data.operacionMensaje, 'Error');
          this.router.navigate(['./pedidos/lista/'+id]);
        }
        this.solicitando = false;
        this.solicitudExitosa = true;
      })
      .catch(err => this.handleError(err));
  }

  guardarPedido(pedidoParam: any){
    this.eventosService.guardar(pedidoParam)
      .then(respuesta => {
          if(respuesta && respuesta.extraInfo){
            this.solicitudExitosa = true;
            this.toastr.success(respuesta.operacionMensaje, 'Exito');
            this.limpiarCampos();
            this.router.navigate(['./pedidos/lista/']);
          }else{
            this.solicitudExitosa = false;
            this.toastr.error(respuesta.operacionMensaje, 'Error');
          }
      })
      .catch(err => this.handleError(err));
  }

  editarPedido(pedidoParam: any){
    this.eventosService.editar(pedidoParam)
      .then(respuesta => {
        if(respuesta !== undefined){
          if(respuesta && respuesta.extraInfo){
            this.solicitudExitosa = true;
            this.toastr.success(respuesta.operacionMensaje, 'Exito');
            this.router.navigate(['./pedidos/seguimiento/'+pedidoParam.id]);
          }else{
            this.solicitudExitosa = false;
            this.toastr.error(respuesta.operacionMensaje, 'Error');
          }
        }
      })
      .catch(err => this.handleError(err));
  }

  nuevoPedido(){
     this.router.navigate(["./pedidos/formulario"]);
  }

  private handleError(error: any): void {
    this.solicitando = false;
    this.solicitudExitosa = false;
    this.toastr.error("Error Interno", 'Error');
  }

  onSubmit(): void {
    this.mensajeForUser = 'Guardando ...';
    this.llenarCampos();
    this.esEdicion ? this.editarPedido(this.pedido) : this.guardarPedido(this.pedido);
  }

  llenarDatosParaEdicion(pedido: any) : void {
    let ocurrencia:Date = new Date(pedido.fechapedido);
    this.pedido.fechapedido = { year: ocurrencia.getFullYear(), month: ocurrencia.getMonth(), day: ocurrencia.getDate() };
    this.cargando = false;

  }

  private llenarCampos(){
    this.pedido.fechapedido = new Date(this.pedido.fechapedido.year,this.pedido.fechapedido.month,this.pedido.fechapedido.day);
  }

  private limpiarCampos(){
     this.pedido = {
      "idcliente":{
        "idpersona":{}
      }
    };
  }

  private limpiarArray(arreglo: Array<any>){
    if(arreglo != null){
        while(arreglo.length > 0) {
          arreglo.pop();
      }
    }
  }

}
