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

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * @author Greg Turnquist
 */
// tag::code[]
@Component
public class DatabaseLoader implements CommandLineRunner {

	private final DataSetRepository repository;

	@Autowired
	public DatabaseLoader(DataSetRepository repository) {
		this.repository = repository;
	}

	@Override
	public void run(String... strings) throws Exception {

		this.repository.save(new DataSet("Frodo Baggins", 33, "Testicle Cancer"));
		this.repository.save(new DataSet("Bilbo Baggins", 44, "Testicle Cancer"));
		this.repository.save(new DataSet("Gandalf the Grey", 55, "Testicle Cancer"));
		this.repository.save(new DataSet("Samwise Gamgee", 22, "Testicle Cancer"));
		this.repository.save(new DataSet("Meriadoc Brandybuck", 18, "Testicle Cancer"));
		this.repository.save(new DataSet("Peregrin Took", 35, "Testicle Cancer"));
		this.repository.save(new DataSet("Frodo Baggins", 32, "Testicle Cancer",
				"{" +
				"   \"sex\": \"male\"," +
				"   \"kids\": \"6\"" +
				"}"));
	}
}
// end::code[]