import React from 'react';
import Navbar from '../components/Navbar';
import Axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import UserImage from '../media/user.jpg';
import Estrellas from '../components/Estrellas';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { LatLng } from 'leaflet';
import EstrellasDejarValoracion from '../components/EstrellasDejarValoracion';
import '../css/PaginaConcretaProducto.css';
import { UserContext } from '../hooks/UserContentHook';
import { useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const PaginaConcretaProducto = () => {
    const user = useContext(UserContext);
    
    function handleCallbackResponse(response) {
        var userObject = jwtDecode(response.credential);
        axios.get('http://localhost:5002/usuarios/correo/' + userObject.email)
            .then((response) => {
                const { data } = response;
                const { message } = data;
                if (message === "No se ha encontrado ningún usuario con ese correo.") {
                    //Por hacer, es pra registrarse, hacer un desvio de pagina a /crearUsuario
                    user.setUser({
                        email: userObject.email,
                    });
                    window.location.href = "http://localhost:3000/crearUsuario";
                    return
                } else {
                    user.setUser({
                        id: data[0]._id,
                        email: userObject.email,
                        name: userObject.name
                    });
                    localStorage.setItem("id", data[0]._id);
                }
            })
            .catch((error) => console.log(error));

    }

    useEffect(() => {
        // Verificar si el objeto 'google' está disponible
        if (window.google && window.google.accounts && window.google.accounts.id) {
            // Inicializar Google Sign-In
            window.google.accounts.id.initialize({
                client_id: '71937643255-t87vgiaf2pignoee98j3uej1q648cp5r.apps.googleusercontent.com',
                callback: handleCallbackResponse,
            });

            window.google.accounts.id.renderButton(
                document.getElementById('sigInDiv'),
                { theme: 'outline', size: 'large', text: 'signIn', width: '300px', height: '50px' }
            );
            console.log(user.user);

        } else {
            console.error("El objeto 'google' no está disponible.");
        }
    }, [handleCallbackResponse])

    const [categorias, setCategorias] = useState([]); // ['Electronica', 'Informatica', 'Hogar'
    const [articulo, setArticulo] = useState({});
    const [vendedor, setVendedor] = useState({});
    const [latitud, setLatitud] = useState(0);
    const [longitud, setLongitud] = useState(0);
    const [position, setPosition] = useState([0, 0]); // [latitud, longitud
    const [imagenes, setImagenes] = useState([]);
    const id = useParams().id;
    const [imagenActual, setImagenActual] = useState(0);
    
    const handleClickImagen = (index) => {
        setImagenActual(index);
    };
    useEffect(() => {
        Axios.get(`http://localhost:5001/productos/${id}`)
            .then(response => {
                if (response.data !== null) {
                    setArticulo(response.data);
                    setCategorias(response.data.categorias.split(','));
                    setImagenes(response.data.imagenes);
                    console.log('Datos del backend:', response.data);
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del backend:', error);
            });
    }, []);

    useEffect(() => {
        axios.get(`http://localhost:5004/mapa/coordenadasProducto/` + id)
            .then(response => {
                if (response.data !== null) {
                    setLatitud(response.data.latitud);
                    setLongitud(response.data.longitud);
                    setPosition([response.data.latitud, response.data.longitud]);


                    console.log('Datos del backend:', response.data);
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del backend:', error);
            });
    }, [articulo]);

    useEffect(() => {
        axios.get(`http://localhost:5002/usuarios/${articulo.vendedor}`)
            .then(response => {
                if (response.data !== null) {

                    setVendedor(response.data);
                    console.log('Datos del backend:', response.data);
                }
            })
            .catch(error => {
                console.error('Error al obtener datos del backend:', error);
            })
    }, [articulo]);

    return (
        <div>
            <Navbar />
            <div className='col-md-6 col-12 bg-white centrarConMargenes mt-4 tarjetaProducto'>
                <div className='d-flex flex-row justify-content-between align-items-center'>
                    <div className='d-flex flew-column align-items-center '>
                        <img src={UserImage} className='fotoProfile' alt="User" />
                        <div>
                            <h5 style={{paddingLeft: '10%'}} className='fs-4 fw-bolder ml-4 mr-4' >{vendedor.nombreCompleto}</h5>
                            <Estrellas valoracion={vendedor.valoracion} numeroValoraciones={vendedor.numeroValoraciones} />
                        </div>

                    </div>
                    <div>
                        {localStorage.id != null  ? <a href={`/chat/${articulo._id}/${vendedor._id}/${localStorage.id}`}><button className="button-36" role="button">Contactar</button></a> :  <div id="sigInDiv" className='d-none d-md-block' style={{ paddingLeft: "2%" }}></div>}
                    </div>
                </div>

                <div className='w-75 centrarConMargenes mt-4 d-flex flex-row'>
                    <div className='d-flex flex-row col-4 overflow-x-auto'>
                        <div className='d-flex flex-column overflow-y-auto overflow-x-hidden'>
                            {imagenes.map((imagen, index) => (
                                <img
                                    key={index}
                                    src={imagen}
                                    alt={`Imagen ${index + 1}`}
                                    className={`imagen ${index === imagenActual ? 'active imagenesLateral' : 'imagenesLateral'}`}
                                    onClick={() => handleClickImagen(index)}
                                />
                            ))}
                        </div>
                    </div>
                    <div className='d-flex  col-8  imagenCentralGrande'>
                        <img src={imagenes[imagenActual]} alt={`Imagen ${imagenActual + 1}`} className='imagenC' />

                    </div>
                </div>

                <div className='d-flex flex-justify-center align-items-center'>
                    <div className='d-flex flex-column  border-bottom w-100'>
                        <h1>{articulo.precioInicial} €</h1>
                        <h1 className='TituloProducto' >{articulo.nombre}</h1>
                        
                        
                    </div>


                </div>
                <div className='d-flex flex-column  border-bottom w-100'>
                    <p className='DescripcionProducto' >{articulo.descripcion}</p>
                {categorias.map((categoria, index) => (
                            <div key={index} className='card m-3'>
                                <div className='card-body'>
                                     <p className='card-text fs-4 fw' >{categoria}</p>
                                </div>
                            </div>
                        ))
                }
                </div>
                <div className='d-flex flex-row align-items-center border-bottom w-100'>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="#29363D" fillRule="evenodd" d="M12 5.25a5.25 5.25 0 1 0 0 10.5 5.25 5.25 0 0 0 0-10.5ZM8.25 10.5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0Z" clipRule="evenodd"></path>
                <path fill="#29363D" fillRule="evenodd" d="m12.56 23.81.063-.033c4.982-2.532 9.865-7.337 9.877-13.28C22.512 4.79 17.75-.05 12 0 6.384.05 1.487 4.664 1.5 10.5c.021 7.863 8.235 12.44 9.883 13.279l.069.035c.174.09.361.186.549.186.19 0 .381-.099.559-.19ZM21 10.5c-.01 5.081-4.235 9.56-8.998 12-.816-.42-3.064-1.77-5.117-3.797C4.775 16.62 3.01 13.877 3 10.5c-.012-4.968 4.178-8.957 9.014-9 4.898-.043 8.996 4.112 8.986 9Z" clipRule="evenodd"></path>
                </svg>
                {vendedor.ciudad !== undefined ? (
                    <p className='ml-2 mt-3'>{vendedor.ciudad}</p>
                ) : (
                    <p className='ml-2 mt-3'>Desconocido</p>
                )}
                </div>
            </div>
            <div className='mapa' id="mapa" >
                { (position[0] !== 0 && position[1] !== 0 && position[0] !== undefined ) ? (
                    <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">
                            OpenStreetMap</a> contributors'
                        />
                        <Marker position={position}>
                            <Popup>{articulo.nombre}</Popup>
                        </Marker>
                    </MapContainer>
                ) : (
                    <p>Cargando mapa...</p>
                )}
                
                {(user.user != null && vendedor._id != null && <div className='d-flex flex-row justify-content-between align-items-center'>
                    <EstrellasDejarValoracion idUsuario={user.user.id} idVendedor={vendedor._id} />
                </div>)}
            </div>


        </div>


    );
};

export default PaginaConcretaProducto;