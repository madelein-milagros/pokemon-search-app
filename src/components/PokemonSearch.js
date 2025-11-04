// src/components/PokemonSearch.js - VERSIÓN CORREGIDA
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Container, Row, Col, Form, Card, Button, Spinner, Alert, Badge,
  InputGroup, Modal
} from 'react-bootstrap';
import { Search, X } from 'react-bootstrap-icons';

const PokemonSearch = () => {
  const [pokemons, setPokemons] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [weightFilter, setWeightFilter] = useState('');
  const [heightFilter, setHeightFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Cargar todos los Pokémon
  const fetchAllPokemons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log("Cargando Pokémon...");
      const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=500');
      const pokemonList = response.data.results;

      const pokemonDetails = await Promise.all(
        pokemonList.map(async (pokemon) => {
          try {
            const detailResponse = await axios.get(pokemon.url);
            return {
              id: detailResponse.data.id,
              name: detailResponse.data.name,
              weight: detailResponse.data.weight,
              height: detailResponse.data.height,
              types: detailResponse.data.types.map(typeInfo => typeInfo.type.name),
              abilities: detailResponse.data.abilities.map(ability => ability.ability.name),
              stats: detailResponse.data.stats.reduce((acc, stat) => {
                acc[stat.stat.name] = stat.base_stat;
                return acc;
              }, {}),
              image: detailResponse.data.sprites.other['official-artwork']?.front_default || 
                     detailResponse.data.sprites.front_default
            };
          } catch (err) {
            console.error(`Error loading pokemon ${pokemon.name}:`, err);
            return null;
          }
        })
      );

      const validPokemons = pokemonDetails.filter(pokemon => pokemon !== null);
      console.log(`Cargados ${validPokemons.length} Pokémon`);
      setPokemons(validPokemons);
      setFilteredPokemons(validPokemons);
    } catch (err) {
      console.error("Error general:", err);
      setError('Error al cargar los Pokémon: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPokemons();
  }, [fetchAllPokemons]);

  // Filtrar Pokémon
  useEffect(() => {
    let results = [...pokemons];

    // Filtrar por nombre
    if (searchTerm) {
      results = results.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por peso
    if (weightFilter) {
      const weightValue = parseInt(weightFilter);
      if (!isNaN(weightValue)) {
        results = results.filter(pokemon => pokemon.weight >= weightValue);
      }
    }

    // Filtrar por altura
    if (heightFilter) {
      const heightValue = parseInt(heightFilter);
      if (!isNaN(heightValue)) {
        results = results.filter(pokemon => pokemon.height >= heightValue);
      }
    }

    // Filtrar por tipo
    if (typeFilter) {
      results = results.filter(pokemon =>
        pokemon.types.some(type => type.toLowerCase() === typeFilter.toLowerCase())
      );
    }

    // Ordenar resultados
    results.sort((a, b) => {
      switch (sortBy) {
        case 'weight':
          return b.weight - a.weight;
        case 'height':
          return b.height - a.height;
        case 'id':
          return a.id - b.id;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredPokemons(results);
  }, [searchTerm, weightFilter, heightFilter, typeFilter, sortBy, pokemons]);

  const clearFilters = () => {
    setSearchTerm('');
    setWeightFilter('');
    setHeightFilter('');
    setTypeFilter('');
    setSortBy('name');
  };

  const openPokemonDetails = (pokemon) => {
    setSelectedPokemon(pokemon);
    setShowModal(true);
  };

  const getTypeColor = (type) => {
    const colors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC'
    };
    return colors[type] || '#68A090';
  };

  // Función para formatear el nombre (primera letra mayúscula)
  const formatName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <Container fluid className="mt-4">
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <h1 style={{ 
              color: '#FF0000', 
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              fontSize: '3rem'
            }}>
              Pokédex
            </h1>
            <p className="text-muted lead">
              Busca y descubre información detallada de Pokémon
            </p>
          </div>
        </Col>
      </Row>

      {/* Filtros */}
      <Row className="mb-4">
        <Col lg={4} className="mb-3">
          <InputGroup>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Buscar Pokémon por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        
        <Col lg={2} className="mb-3">
          <Form.Control
            type="number"
            placeholder="Peso mínimo"
            value={weightFilter}
            onChange={(e) => setWeightFilter(e.target.value)}
          />
        </Col>

        <Col lg={2} className="mb-3">
          <Form.Control
            type="number"
            placeholder="Altura mínima"
            value={heightFilter}
            onChange={(e) => setHeightFilter(e.target.value)}
          />
        </Col>

        <Col lg={2} className="mb-3">
          <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">Todos los tipos</option>
            <option value="normal">Normal</option>
            <option value="fire">Fuego</option>
            <option value="water">Agua</option>
            <option value="electric">Eléctrico</option>
            <option value="grass">Planta</option>
            <option value="ice">Hielo</option>
            <option value="fighting">Lucha</option>
            <option value="poison">Veneno</option>
            <option value="ground">Tierra</option>
            <option value="flying">Volador</option>
            <option value="psychic">Psíquico</option>
            <option value="bug">Bicho</option>
            <option value="rock">Roca</option>
            <option value="ghost">Fantasma</option>
            <option value="dragon">Dragón</option>
            <option value="dark">Siniestro</option>
            <option value="steel">Acero</option>
            <option value="fairy">Hada</option>
          </Form.Select>
        </Col>

        <Col lg={2} className="mb-3">
          <Form.Select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Orden: Nombre</option>
            <option value="id">Orden: ID</option>
            <option value="weight">Orden: Peso</option>
            <option value="height">Orden: Altura</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Botón limpiar */}
      <Row className="mb-4">
        <Col className="d-flex justify-content-end">
          <Button variant="outline-danger" onClick={clearFilters}>
            <X className="me-2" />
            Limpiar Filtros
          </Button>
        </Col>
      </Row>

      {/* Loading */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" variant="danger" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3">Cargando Pokémon...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="text-center">
          {error}
        </Alert>
      )}

      {/* Contador */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-muted">
              Mostrando {filteredPokemons.length} de {pokemons.length} Pokémon
            </span>
          </div>
        </Col>
      </Row>

      {/* Grid de Pokémon */}
      <Row>
        {filteredPokemons.map(pokemon => (
          <Col key={pokemon.id} xs={6} sm={4} md={3} lg={2} className="mb-4">
            <Card 
              className="h-100 pokemon-card shadow-sm" 
              onClick={() => openPokemonDetails(pokemon)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Img 
                variant="top" 
                src={pokemon.image} 
                alt={pokemon.name}
                style={{ 
                  height: '120px', 
                  objectFit: 'contain',
                  padding: '10px',
                  backgroundColor: '#f8f9fa'
                }}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/150/FF0000/FFFFFF?text=Pokémon';
                }}
              />
              <Card.Body className="d-flex flex-column p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Badge bg="secondary">#{pokemon.id.toString().padStart(3, '0')}</Badge>
                  <div>
                    {pokemon.types.map(type => (
                      <Badge 
                        key={type}
                        style={{ 
                          backgroundColor: getTypeColor(type),
                          marginLeft: '2px',
                          fontSize: '0.6rem'
                        }}
                      >
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Card.Title className="fs-6" style={{ minHeight: '40px' }}>
                  {formatName(pokemon.name)}
                </Card.Title>
                <Card.Text className="small text-muted">
                  <strong>Peso:</strong> {(pokemon.weight / 10).toFixed(1)} kg<br />
                  <strong>Altura:</strong> {(pokemon.height / 10).toFixed(1)} m
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredPokemons.length === 0 && !loading && (
        <Row>
          <Col className="text-center py-5">
            <div style={{ fontSize: '4rem' }}>😞</div>
            <h4>No se encontraron Pokémon</h4>
            <p className="text-muted">Intenta con otros filtros de búsqueda</p>
            <Button variant="primary" onClick={clearFilters}>
              Limpiar filtros
            </Button>
          </Col>
        </Row>
      )}

      {/* Modal de detalles */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedPokemon && formatName(selectedPokemon.name)} #{selectedPokemon?.id.toString().padStart(3, '0')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPokemon && (
            <Row>
              <Col md={6}>
                <img 
                  src={selectedPokemon.image} 
                  alt={selectedPokemon.name}
                  style={{ width: '100%', maxWidth: '300px' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300/FF0000/FFFFFF?text=Pokémon';
                  }}
                />
                <div className="mt-3">
                  {selectedPokemon.types.map(type => (
                    <Badge 
                      key={type}
                      style={{ 
                        backgroundColor: getTypeColor(type),
                        marginRight: '5px',
                        fontSize: '1rem',
                        padding: '8px 12px'
                      }}
                    >
                      {type.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </Col>
              <Col md={6}>
                <h5>Estadísticas</h5>
                {selectedPokemon.stats && Object.entries(selectedPokemon.stats).map(([stat, value]) => (
                  <div key={stat} className="mb-2">
                    <small className="text-capitalize">
                      <strong>{stat}:</strong> {value}
                    </small>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className="progress-bar" 
                        style={{ 
                          width: `${(value / 255) * 100}%`,
                          backgroundColor: getTypeColor(selectedPokemon.types[0])
                        }}
                      />
                    </div>
                  </div>
                ))}
                <h5 className="mt-3">Información</h5>
                <p>
                  <strong>Peso:</strong> {(selectedPokemon.weight / 10).toFixed(1)} kg<br />
                  <strong>Altura:</strong> {(selectedPokemon.height / 10).toFixed(1)} m<br />
                  <strong>Habilidades:</strong> {selectedPokemon.abilities.map(ability => 
                    ability.charAt(0).toUpperCase() + ability.slice(1)
                  ).join(', ')}
                </p>
              </Col>
            </Row>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PokemonSearch;