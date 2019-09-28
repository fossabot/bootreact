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
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Version;

/**
 * @author Greg Turnquist
 */
// tag::code[]
@Entity
@Data
@NoArgsConstructor
public class DataSet {

	private @Id @GeneratedValue Long id;
	private String name;
	private Integer age;
	private String diagnosis;

	private @Version @JsonIgnore Long version;

	public DataSet(String firstName, Integer lastName, String diagnosis) {
		this.name = firstName;
		this.age = lastName;
		this.diagnosis = diagnosis;
	}
}
// end::code[]