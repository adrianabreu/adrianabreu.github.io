+++
Description = ""
date = "2017-04-08T17:33:10Z"
title = "Capas en el backend"

+++

Una de las cosas más difíciles cuando ves un proyecto de backend por primera vez es discernir la funcionalidad y responsabilidad de las distintas capas. Así que me he planteado dar una visión general.

Antes de nada, quiero aclarar que es probable que esta nomenclatura no coincida con otra que veais por ahí, existen muchos sinónimos para los mismos conceptos, yo por mi parte, voy a explicar cual utilizo actualmente.

Por supuesto, todo estará ilustrado con un sencillo proyecto de ejemplo que he hecho para la ocasión. Así que, comencemos por el patrón DTO. 

## Data Transfer Object

Un DTO es un objeto que se utiliza en transferencias. Existen varios motivos para utilizar este tipo de objeto: 

El motivo original es que con lo costoso que resulta abrir un canal de comunicación, debería traerse toda la información posible en esta para "amortizarla".

No siempre es necesario mandar al front end todos los campos del backend. Quizás algunos campos sean de control, o quizás no necesitemos transferir todo el objeto.

```
public class GreetingDTO {

	private Long id;
	
	private String message;

	
	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}	
}
```

## Mapper

Para convertir las entidades en DTO y viceversa, utilizamos un mapper. Aquí un breve ejemplo. Nótese que lo he anotado como un componente de Spring con @Component.

```
@Component
public class GreetingMapper {

	public GreetingDTO toDTO(Greeting source) {
		if (source == null) {
			return null;
		}
		
		GreetingDTO target = new GreetingDTO();
		target.setId(source.getId());
		target.setMessage(source.getMessage());
		return target;
	}
	
	public Greeting toEntity(GreetingDTO source) {
		if (source == null) {
			return null;
		}
		
		Greeting target = new Greeting();
		target.setId(source.getId());
		target.setMessage(source.getMessage());
		return target;
	}
	
	public List<GreetingDTO> toDTOList(List<Greeting> source) {
		if (source == null) {
			return null;
		}
		List<GreetingDTO> target = source.stream().map(greeting -> toDTO(greeting)).collect(Collectors.toList());
		return target;	
	}
	
	public List<Greeting> toEntityList(List<GreetingDTO> source) {
		if (source == null) {
			return null;
		}
		List<Greeting> target = source.stream().map(greetingDTO -> toEntity(greetingDTO)).collect(Collectors.toList());
		return target;
				
	}
}
```

## Resource / Controller

Los controladores (denominados también recursos) van a ser los encargados de relacionar tal acción cuando ejecutemos X método HTTP (GET, POST, PUT, DELETE...) sobre Y ruta (/users, /greetings).

Es importante separar la lógica de negocio del controlador. Por lo general, un controlador solo debería llamar a los mapper y a los servicios que correspondan. 

```
@RequestMapping("/greetings")
@RestController
public class GreetingResource {

	@Autowired
	private GreetingService greetingService;
	
	@Autowired
	private GreetingMapper greetingMapper;
	
    @GetMapping("")
    public List<GreetingDTO> obtener() {
    	List<Greeting> greetings = greetingService.findAll();
    	List<GreetingDTO> greetingDTOs = greetingMapper.toDTOList(greetings);
    	return greetingDTOs;
    }
    
    
    @PostMapping("")
    public GreetingDTO crear(GreetingDTO greetingDTO) {
    	Greeting greeting = greetingMapper.toEntity(greetingDTO);
    	greeting = greetingService.save(greeting);
    	greetingDTO = greetingMapper.toDTO(greeting);
    	
    	return greetingDTO;
    }
    
    @GetMapping("/{id}")
    public GreetingDTO optenerPorId(@PathVariable(value="id") Long greetingId) {
    	Greeting greeting = greetingService.findOneById(greetingId);
    	GreetingDTO greetingDTO = greetingMapper.toDTO(greeting);
    	return greetingDTO;
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity borrar(@PathVariable(value="id") Long greetingId) {
    	greetingService.delete(greetingId);
    	return new ResponseEntity<>(HttpStatus.OK);
    }
    
}
```

## Service

La capa de servicio es la capa que se encargará de gestionar la lógica de negocio y de "enmascarar" la capa de acceso a los datos.

```
@Service
public class GreetingService {
	
	@Autowired
	private GreetingRepository greetingRepository;
	
	
	public List<Greeting> findAll() {
		return greetingRepository.findAll();
	}
	
	public Greeting findOneById(Long id) {
		return greetingRepository.findOneById(id);
	}
	
	public Greeting save(Greeting greeting) {
		// Usando la lógica de negocio modificamos los campos que solo nos interesan de la entidad
		greeting.setUpdated(Boolean.TRUE);
		return greetingRepository.save(greeting);
	}
	
	public void delete(Long id) {
		greetingRepository.delete(id);
	}
}
```

## Repository

La capa de repository se encargará de acceder a los datos. Para este ejemplo tan sencillo he utilizado como almacenamiento un HashMap.

```
@Repository
public class GreetingRepository {

	private AtomicInteger idCounter = new AtomicInteger();
	private HashMap<Long,Greeting> greetings = new HashMap();
	
	public List<Greeting> findAll() {
		return new ArrayList<Greeting>(greetings.values());
	}
	
	public Greeting findOneById(Long id) {
		return greetings.get(id);
	}
	
	public Greeting save(Greeting greeting) {
		greeting.setId(idCounter.longValue());
		greetings.put(idCounter.longValue(), greeting);
		idCounter.incrementAndGet();
		return greeting;
	}
	
	public void delete(Long id) {
		greetings.remove(id);
	}
}
```

Para demostrar que el ejemplo funciona correctamente, haré algunas peticiones REST. Para esto, utilizo normalmente el cliente [Postman](https://www.getpostman.com/).

Primero, almacenaremos dos objetos. 
{{< figure src="/images/capas-backend/1.png" >}}

Después, recuperaremos la lista de objetos.
{{< figure src="/images/capas-backend/2.png" >}}

Por último, borremos uno de ellos.
{{< figure src="/images/capas-backend/3.png" >}}

Como vemos, las diferentes capas en la aplicación hacen una gran separación de responsabilidades. Dandonos una estructura clara y robusta.

[Aquí tenéis el proyecto completo en Github](https://github.com/adrianabreu/spring-layers-example), para poder ver el código completo.

## Bibliografía

* [https://martinfowler.com/eaaCatalog/dataTransferObject.html](https://martinfowler.com/eaaCatalog/dataTransferObject.html)
* [https://martinfowler.com/eaaCatalog/serviceLayer.html](https://martinfowler.com/eaaCatalog/serviceLayer.html)
* [https://martinfowler.com/eaaCatalog/applicationController.html](https://martinfowler.com/eaaCatalog/applicationController.html)