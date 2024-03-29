/*
 * Copyright 2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package seal;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.vladmihalcea.hibernate.type.json.JsonBinaryType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;

import javax.persistence.*;
import javax.validation.constraints.*;

/**
 * @author Greg Turnquist
 */
// tag::code[]
@Entity
@Data
@NoArgsConstructor
@TypeDef(
		name = "jsonb",
		typeClass = JsonBinaryType.class
)
public class DataSet {

	private @Id @GeneratedValue Long id;

    @NotBlank(message = "Name is mandatory")

    @NotBlank(message = "Name is mandatory")
    @Size(min = 2, max = 200)
	private String name;

    @NotNull(message = "Age is mandatory")
    @Min(value = 0, message = "Age can not be less than 0")
    @Max(value = 150, message = "Age should not be greater than 150")
	private Integer age;

    @NotBlank(message = "Diagnosis is mandatory")
    @Size(min = 5, max = 500)
	private String diagnosis;

	@Type(type = "jsonb")
	@Column(columnDefinition = "jsonb")
	private String properties;

	private @Version @JsonIgnore Long version;

	public DataSet(String name, Integer age, String diagnosis) {
		this.name = name;
		this.age = age;
		this.diagnosis = diagnosis;
	}

	public DataSet(String name, Integer age, String diagnosis, String properties) {
		this.name = name;
		this.age = age;
		this.diagnosis = diagnosis;
		this.properties = properties;
	}
}
// end::code[]