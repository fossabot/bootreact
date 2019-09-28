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
import org.springframework.data.rest.core.annotation.HandleAfterCreate;
import org.springframework.data.rest.core.annotation.HandleAfterDelete;
import org.springframework.data.rest.core.annotation.HandleAfterSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.hateoas.EntityLinks;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static seal.WebSocketConfiguration.MESSAGE_PREFIX;

/**
 * @author Greg Turnquist
 */
// tag::code[]
@Component
@RepositoryEventHandler(DataSet.class)
public class EventHandler {

	private final SimpMessagingTemplate websocket;

	private final EntityLinks entityLinks;

	@Autowired
	public EventHandler(SimpMessagingTemplate websocket, EntityLinks entityLinks) {
		this.websocket = websocket;
		this.entityLinks = entityLinks;
	}

	@HandleAfterCreate
	public void newDataSet(DataSet dataSet) {
		this.websocket.convertAndSend(
				MESSAGE_PREFIX + "/newDataSet", getPath(dataSet));
	}

	@HandleAfterDelete
	public void deleteDataSet(DataSet dataSet) {
		this.websocket.convertAndSend(
				MESSAGE_PREFIX + "/deleteDataSet", getPath(dataSet));
	}

	@HandleAfterSave
	public void updateDataSet(DataSet dataSet) {
		this.websocket.convertAndSend(
				MESSAGE_PREFIX + "/updateDataSet", getPath(dataSet));
	}

	/**
	 * Take an {@link DataSet} and get the URI using Spring Data REST's {@link EntityLinks}.
	 *
	 * @param dataSet
	 */
	private String getPath(DataSet dataSet) {
		return this.entityLinks.linkForSingleResource(dataSet.getClass(),
				dataSet.getId()).toUri().getPath();
	}

}
// end::code[]
